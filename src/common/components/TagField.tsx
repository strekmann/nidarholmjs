import AutoComplete from "material-ui/AutoComplete";
import Chip from "@material-ui/core/Chip";
import * as React from "react";
import { RelayRefetchProp } from "react-relay";
import { createRefetchContainer, graphql } from "react-relay";

import { TagField_organization } from "./__generated__/TagField_organization.graphql";

type Props = {
  autoFocus: boolean,
  fileTags: string[],
  onChange: any, // (string[]) => {},
  organization: TagField_organization,
  relay: RelayRefetchProp,
};

type State = {
  tag: string,
};

class TagField extends React.Component<Props, State> {
  state = {
    tag: "",
  };

  onTagChange = (tag) => {
    this.setState({ tag });
    this.props.relay.refetch((variables) => {
      return {
        searchTags: variables.searchTags,
        searchTerm: tag,
      };
    });
  };

  addTag = (chosen) => {
    let tag = chosen;
    if (tag instanceof Object) {
      tag = tag.value;
    }
    const fileTags = new Set(this.props.fileTags);
    fileTags.add(tag);
    this.setState({
      tag: "",
    });
    this.props.onChange(Array.from(fileTags));
  };

  removeTag = (tag) => {
    const fileTags = this.props.fileTags.filter((t) => {
      return t !== tag;
    });
    this.props.onChange(fileTags);
  };

  render() {
    const tags = this.props.organization.tags || [];
    return (
      <div>
        <AutoComplete
          floatingLabelText="Søk i merkelapper"
          dataSource={tags.map((tag) => {
            return { text: `${tag.tag} (${tag.count})`, value: tag.tag };
          })}
          maxSearchResults={8}
          searchText={this.state.tag}
          onNewRequest={this.addTag}
          onUpdateInput={this.onTagChange}
          filter={() => {
            return true;
          }}
          autoFocus={this.props.autoFocus}
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {this.props.fileTags.map((tag) => {
            return (
              <Chip
                key={tag}
                onDelete={() => {
                  this.removeTag(tag);
                }}
                label={tag}
              />
            );
          })}
        </div>
      </div>
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
