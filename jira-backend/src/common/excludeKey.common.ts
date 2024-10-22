export function exclude<T, Key extends keyof T>(
  objData: T,
  keys: Key[]
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(objData as Record<string, unknown>).filter(
      ([key]) => !keys.includes(key as Key)
    )
  ) as Omit<T, Key>;
}
