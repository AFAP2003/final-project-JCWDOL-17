export const pagination = (page: number = 1, take: number = 5) => {
    const skip = page > 1 ? (page - 1) * take : 0;
    return { skip, take };
  };