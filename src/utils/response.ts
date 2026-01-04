export const success = (
  data: any,
  meta: any = null
) => ({
  data,
  meta,
  errors: null
});

export const error = (
  message: string,
  code = 'BAD_REQUEST'
) => ({
  data: null,
  meta: null,
  errors: { message, code }
});
