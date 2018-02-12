import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

class TagField extends React.Component {
    static propTypes = {
        fileTags: PropTypes.array,
        onChange: PropTypes.func,
        organization: PropTypes.object,
        relay: PropTypes.object.isRequired,
        autoFocus: PropTypes.bool,
    }

    state = {
        tag: '',
    }

    onTagChange = (tag) => {
        this.setState({ tag });
        this.props.relay.refetch((variables) => {
            return {
                searchTags: variables.searchTags,
                searchTerm: tag,
            };
        });
    }

    addTag = (chosen) => {
        const fileTags = new Set(this.props.fileTags);
        fileTags.add(chosen);
        this.setState({
            tag: '',
        });
        this.props.onChange(Array.from(fileTags));
    }

    removeTag = (tag) => {
        const fileTags = this.props.fileTags.filter((t) => {
            return t !== tag;
        });
        this.props.onChange(fileTags);
    }

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
                <div style={{ display: 'flex' }}>
                    {this.props.fileTags.map((tag) => {
                        return (
                            <Chip
                                key={tag}
                                onRequestDelete={() => {
                                    this.removeTag(tag);
                                }}
                            >
                                {tag}
                            </Chip>
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
            searchTags: {type: "String", defaultValue: ""}
            searchTerm: {type: "String", defaultValue: ""}
        ) {
            id
            tags(tags: $searchTags, term: $searchTerm) {
                tag
                count
            }
        }`,
    },
    graphql`
    query TagFieldRefetchQuery($searchTags: String, $searchTerm: String) {
        organization {
            ...TagField_organization @arguments(searchTags: $searchTags, searchTerm: $searchTerm)
        }
    }`,

);
