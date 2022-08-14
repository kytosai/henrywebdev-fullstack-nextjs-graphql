import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

type WrapperSize = 'regular' | 'small';

interface WrapperProps {
  children: ReactNode;
  size?: WrapperSize;
}

const Wrapper = (props: WrapperProps) => {
  const { children, size = 'regular' } = props;

  return (
    <Box maxW={size === 'regular' ? '768px' : '400px'} marginX="auto" my={4}>
      {children}
    </Box>
  );
};

export default Wrapper;
