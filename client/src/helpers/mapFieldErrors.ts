import { FieldError } from '@/generated/graphql';

export const mapFieldErrors = (errors: FieldError[]): { [key: string]: any } => {
  return errors.reduce((accumulatedErrorsObj, currentVal) => {
    return {
      ...accumulatedErrorsObj,
      [currentVal.field]: currentVal.message,
    };
  }, {});
};
