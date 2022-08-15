import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { useField } from 'formik';
import { HTMLInputTypeAttribute } from 'react';

interface InputFieldProps {
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder?: string;
  textarea?: boolean;
}

const InputField = (props: InputFieldProps) => {
  const [field, { error }] = useField(props);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={props.name}>{props.label}</FormLabel>

      {props.textarea ? (
        <Textarea {...field} />
      ) : (
        <Input placeholder={props.placeholder} {...field} />
      )}

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default InputField;
