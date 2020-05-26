import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import * as React from "react";
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay";
import { TagField_organization } from "./__generated__/TagField_organization.graphql";

type Props = {
  autoFocus?: boolean,
  onChange: any, // (string[]) => {},
  fileTags: string[],
  fullWidth?: boolean,
  organization: TagField_organization,
  relay: RelayRefetchProp,
  style?: any,
};

type State = {};

class TagField extends React.Component<Props, State> {
  onTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.relay.refetch((variables) => {
      return {
        searchTags: variables.searchTags,
        searchTerm: event.target.value,
      };
    });
  };

  setTags = (_: any, tags: string[]) => {
    this.props.onChange(tags);
  };

  render() {
    const tags = this.props.organization.tags || [];
    return (
      <Autocomplete
        multiple
        freeSolo
        style={this.props.style}
        options={tags.map((tag) => tag.tag)}
        onChange={this.setTags}
        value={this.props.fileTags}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              label="Søk i merkelapper"
              onChange={this.onTagChange}
              fullWidth={this.props.fullWidth}
            />
          );
        }}
        renderTags={(options, getTagProps) => {
          return options.map((option, index) => {
            return (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            );
          });
        }}
      />
    );
  }
}

export default createRefetchContainer(
  TagField,
  {
    organization: graphql`
      fragment TagField_organization on Organization
        @argumentDefinitions(
          searchTags: { type: "String", defaultValue: "" }
          searchTerm: { type: "String", defaultValue: "" }
        ) {
        id
        tags(tags: $searchTags, term: $searchTerm) {
          tag
          count
        }
      }
    `,
  },
  graphql`
    query TagFieldRefetchQuery($searchTags: String, $searchTerm: String) {
      organization {
        ...TagField_organization
          @arguments(searchTags: $searchTags, searchTerm: $searchTerm)
      }
    }
  `,
);
