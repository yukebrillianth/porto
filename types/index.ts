// ============================================================================
// Generic Utility Types
// ============================================================================

/**
 * Make certain keys of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make certain keys of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Extract the resolved type of a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract props type from a React component
 */
export type PropsOf<T extends React.ComponentType<unknown>> =
  T extends React.ComponentType<infer P> ? P : never;
