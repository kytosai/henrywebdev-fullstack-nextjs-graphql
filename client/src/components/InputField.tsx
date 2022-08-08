import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import { HTMLInputTypeAttribute } from 'react';

interface InputFieldProps {
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
}

const InputField = (props: InputFieldProps) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={props.name}>{props.label}</FormLabel>

      <Input placeholder={props.placeholder} {...field} />

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
