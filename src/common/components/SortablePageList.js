import PropTypes from 'prop-types';
import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';

import SortablePageItem from './SortablePageItem';

@DragDropContext(HTML5Backend)
export default class SortablePageList extends React.Component {
    static propTypes = {
        pages: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }
    state = {
        pages: this.props.pages,
    }

    onRemoveSummary = (page) => {
        const { pages } = this.state;
        pages.splice(page.index, 1);
        this.setState({ pages });
        this.props.onChange(this.state.pages);
    }

    movePage = (dragIndex, hoverIndex) => {
        const { pages } = this.state;
        const dragPage = pages[dragIndex];

        this.setState(update(this.state, {
            pages: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragPage],
                ],
            },
        }));
        this.props.onChange(this.state.pages);
    }

    render() {
        const { pages } = this.state;
        return (
            <div>
                {pages.map((page, index) => {
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
