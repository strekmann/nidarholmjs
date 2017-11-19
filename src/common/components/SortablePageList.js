import PropTypes from 'prop-types';
import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';

import SortablePageItem from './SortablePageItem';

@DragDropContext(HTML5Backend)
export default class SortablePageList extends React.Component {
    static propTypes = {
        summaries: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }

    state = {
        summaries: this.props.summaries,
    }

    componentWillReceiveProps(nextProps) {
        this.state.summaries = nextProps.summaries;
    }

    onRemoveSummary = (page) => {
        const summaries = [...this.state.summaries];
        summaries.splice(page.index, 1);
        this.setState({ summaries });
        this.props.onChange(summaries);
    }

    movePage = (dragIndex, hoverIndex) => {
        const dragPage = this.state.summaries[dragIndex];
        this.setState(update(this.state, {
            summaries: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragPage],
                ],
            },
        }));
        this.props.onChange(this.state.summaries);
    }

    render() {
        const { summaries } = this.state;
        return (
            <div>
                {summaries.map((page, index) => {
                    return (
                        <SortablePageItem
                            key={page.id}
                            id={page.id}
                            index={index}
                            slug={page.slug}
                            title={page.title}
                            movePage={this.movePage}
                            onRemoveSummary={this.onRemoveSummary}
                        />
                    );
                })}
            </div>
        );
    }
}
