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
        fileTags: this.props.fileTags || [],
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
        const fileTags = new Set(this.state.fileTags);
        fileTags.add(chosen.value);
        this.setState({
            fileTags: Array.from(fileTags),
            tag: '',
        });
        this.props.onChange(Array.from(fileTags));
    }

    removeTag = (tag) => {
        const fileTags = this.state.fileTags.filter((t) => {
            return t !== tag;
        });
        this.setState({ fileTags });
        this.props.onChange(fileTags);
    }

    render() {
        const tags = this.props.organization.tags || [];
        return (
            <div>
                <AutoComplete
                    floatingLabelText="Søk i merkelapper"
                    dataSource={tags.map((tag) => {
                        return { text: tag.tag, value: tag.tag };
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
                {this.state.fileTags.map((tag) => {
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
