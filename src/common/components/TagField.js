import React from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import TagItem from './TagItem';

export default class TagField extends React.Component {
    static propTypes = {
        allTags: React.PropTypes.array,
        tags: React.PropTypes.array,
        onChange: React.PropTypes.func,
        onChangeTerm: React.PropTypes.func,
        term: React.PropTypes.string,
    }

    state = {
        tags: this.props.tags ? this.props.tags.split('|') : [],
        tag: this.props.term || '',
    }

    onTagChange = (value) => {
        this.setState({
            tag: value,
        });
        this.props.onChangeTerm(value);
    }

    addTag = (chosen) => {
        const tags = new Set(this.state.tags);
        tags.add(chosen.value);
        this.setState({
            tags: Array.from(tags),
            tag: '',
        });
        this.props.onChange(Array.from(tags));
    }

    removeTag = (tag) => {
        const tags = this.state.tags.filter(t => t !== tag);
        this.setState({ tags });
        this.props.onChange(tags);
    }

    render() {
        return (
            <div>
                <div>
                    <List>
                        <Subheader>Merkelapper</Subheader>
                        {this.state.tags.map(
                            tag => <TagItem
                                key={tag}
                                removeTag={this.removeTag}
                                tag={tag}
                            />
                        )}
                    </List>
                </div>

                <AutoComplete
                    id="tags"
                    floatingLabelText="Søk i merkelapper"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={this.props.allTags.map(
                        tag => ({ text: tag.tag, value: tag.tag })
                    )}
                    maxSearchResults={8}
                    searchText={this.state.tag}
                    onNewRequest={this.addTag}
                    onUpdateInput={this.onTagChange}
                />
            </div>
        );
    }
}
