import { Moment } from "moment";
import { commitMutation, graphql } from "react-relay";
import { RelayModernEnvironment } from "relay-runtime/lib/store/RelayModernEnvironment";

type ProjectProps = {
  title: string;
  tag: string;
  privateMdtext: string;
  publicMdtext: string;
  start: Moment;
  end: Moment;
  permissions: any;
};

const mutation = graphql`
  mutation AddProjectMutation($input: AddProjectInput!) {
    addProject(input: $input) {
      organization {
        ...Projects_organization
      }
    }
  }
`;

function commit(
  environment: RelayModernEnvironment,
  {
    title,
    tag,
    privateMdtext,
    publicMdtext,
    start,
    end,
    permissions,
  }: ProjectProps,
  onCompleted: any,
) {
  const variables = {
    input: {
      title,
      tag,
      privateMdtext,
      publicMdtext,
      start,
      end,
      permissions,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
  });
}

export default { commit };
