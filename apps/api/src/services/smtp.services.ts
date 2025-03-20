import { mailerclient } from '@/smtp';
import { TemplateName } from '@/types/template.type';
import fs from 'fs';
import hb from 'handlebars';
import path from 'path';

let TEMPLATE_CONTAINER: Record<string, ReturnType<typeof hb.compile>> | null =
  null;

type SendParams = {
  tmplname: TemplateName;
  to: string;
  subject: string;
  data?: Record<string, any>;
};

export class SMTPService {
  constructor() {
    if (!TEMPLATE_CONTAINER) SMTPService.compileTemplate();
  }

  /**
   * Sends an email using the specified template and parameters.
   *
   * @param {SendParams} param - The parameters required to send an email.
   * @param {string} param.to - Recipient's email address.
   * @param {string} param.subject - Email subject line.
   * @param {TemplateName} param.tmplname - The name of the email template to use.
   * @param {Record<string, any>} param.data - Data to populate the template.
   *
   * @throws {Error} If the template does not exist.
   */
  public sendMail = (param: SendParams) => {
    const template = TEMPLATE_CONTAINER![param.tmplname];
    const html = template(param.data);
    mailerclient.sendMail({
      to: param.to,
      subject: param.subject,
      html: html,
    });
  };

  private static compileTemplate = () => {
    if (TEMPLATE_CONTAINER !== null) return;

    TEMPLATE_CONTAINER = {};
    const dirpath = path.resolve(__dirname, '../templates');

    try {
      const files = fs.readdirSync(dirpath);
      const hbsFiles = files.filter((file) => path.extname(file) === '.hbs');

      hbsFiles.forEach((filename) => {
        const key = path.basename(filename, '.hbs');
        const fileContent = fs.readFileSync(
          path.join(dirpath, filename),
          'utf-8',
        );
        const compiledtmpl = hb.compile(fileContent);

        TEMPLATE_CONTAINER![key] = compiledtmpl;
      });
    } catch (error: any) {
      throw new Error(
        `SMTPService: error compiling template: ${error.toString()}`,
      );
    }
  };
}
