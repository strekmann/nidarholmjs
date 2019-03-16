// @flow

import React from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";

import SortablePageItem from "./SortablePageItem";

type Page = {
  id: string,
  slug: string,
  title: string,
};

type Props = {
  summaries: Array<Page>,
  onChange: (Array<Page>) => void,
};

type State = {
  summaries: Array<Page>,
};

@DragDropContext(HTML5Backend)
export default class SortablePageList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { summaries } = this.props;
    this.state = {
      summaries: [...summaries],
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.state.summaries = nextProps.summaries;
  }

  onRemoveSummary = (page: Page) => {
    const { onChange } = this.props;
    const summaries = [...this.state.summaries];
    summaries.splice(page.index, 1);
    this.setState({ summaries });
    onChange(summaries);
  };

  movePage = (dragIndex: number, hoverIndex: number) => {
    const { onChange } = this.props;
    const { summaries } = this.state;
    const dragPage = summaries[dragIndex];
    this.setState(
      update(this.state, {
        summaries: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragPage]],
        },
      }),
    );
    onChange(summaries);
  };

  render() {
    const { summaries } = this.state;
    return (
      <div>
        {summaries.map((page, index) => {
          const { id, slug, title } = page;
          return (
            <SortablePageItem
              key={id}
              index={index}
              slug={slug}
              title={title}
              movePage={this.movePage}
              onRemoveSummary={this.onRemoveSummary}
            />
          );
        })}
      </div>
    );
  }
}
