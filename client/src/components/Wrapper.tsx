import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface WrapperProps {
  children: ReactNode;
}

const Wrapper = (props: WrapperProps) => {
  const { children } = props;

  return (
    <Box maxW={400} marginX="auto" my={4}>
      {children}
    </Box>
  );
};

export default Wrapper;
