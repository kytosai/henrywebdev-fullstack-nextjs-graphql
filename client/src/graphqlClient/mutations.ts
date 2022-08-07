import { gql } from '@apollo/client';

export const registerMutation = gql`
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      code
      message
      user {
        id
        username
        email
      }
      errors {
        field
        message
      }
    }
  }
`;
