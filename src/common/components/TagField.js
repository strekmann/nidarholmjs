import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import React from 'react';
import Relay from 'react-relay';

class TagField extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        fileTags: React.PropTypes.array,
        onChange: React.PropTypes.func,
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
        autoFocus: React.PropTypes.bool,
    }

    state = {
        fileTags: this.props.fileTags || [],
        tag: '',
    }

    onTagChange = (tag) => {
        this.setState({ tag });
        this.props.relay.setVariables({ term: tag });
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

export default Relay.createContainer(TagField, {
    initialVariables: {
        term: '',
        tags: '',
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                tags(tags:$tags, term:$term) {
                    tag
                    count
                }
            }`;
        },
    },
});
