export const createIdFindOptions = (ids: number[]): { id: number }[] => {
  return ids.map((id) => {
    return { id: id };
  });
};
