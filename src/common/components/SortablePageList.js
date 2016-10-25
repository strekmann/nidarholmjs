import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';

import SortablePageItem from './SortablePageItem';

@DragDropContext(HTML5Backend)
export default class SortablePageList extends React.Component {
    static propTypes = {
        pages: React.PropTypes.array.isRequired,
        onChange: React.PropTypes.func.isRequired,
    }
    state = {
        pages: this.props.pages,
    }

    movePage = (pageId, hoverIndex) => {
        const { pages } = this.state;
        const dragIndex = pages.findIndex(page => page.id === pageId);
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
                {pages.map(page => <SortablePageItem
                    key={page.slug}
                    id={page.id}
                    slug={page.slug}
                    movePage={this.movePage}
                />)}
            </div>
        );
    }
}

