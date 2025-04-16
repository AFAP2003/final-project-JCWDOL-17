export function calculateMetadataPagination({
  totalRecord,
  page,
  pageSize,
}: {
  totalRecord: number;
  page: number;
  pageSize: number;
}) {
  if (!totalRecord || totalRecord === 0) {
    return null;
  }
  return {
    currentPage: page,
    pageSize: pageSize,
    firstPage: 1,
    lastPage: Math.ceil(totalRecord / pageSize),
    totalRecord: totalRecord,
  };
}

export function calculateOffsite({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  if (!pageSize || pageSize <= 0 || !page || page <= 0) {
    return 0;
  }
  return (page - 1) * pageSize;
}
