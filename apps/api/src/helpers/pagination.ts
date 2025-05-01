export const pagination = (page: number = 1, take: number = 5) => {
  const skip = page > 1 ? (page - 1) * take : 0;
  return { skip, take };
};

export function calculateMetadataPagination({
  totalRecord,
  page,
  pageSize,
}: {
  totalRecord: number;
  page: number;
  pageSize: number;
}) {
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
