// @flow

import type { RelayRefetchProp } from "react-relay";
import RaisedButton from "material-ui/RaisedButton";
import React from "react";
import { createRefetchContainer, graphql } from "react-relay";

import ProjectItem from "./ProjectItem";
import ProjectListPreviousOrganization from "./__generated__/ProjectListPrevious_organization.graphql";

const PROJECTS_PER_PAGE = 10;

type Props = {
  title: string,
  organization: ProjectListPreviousOrganization,
  relay: RelayRefetchProp,
};

class ProjectListPrevious extends React.Component<Props> {
  loadMore = () => {
    const { previousProjects } = this.props.organization;
    this.props.relay.refetch(() => {
      return {
        showProjects: previousProjects.edges.length + PROJECTS_PER_PAGE,
      };
    });
  };

  render() {
    const { previousProjects } = this.props.organization;
    return (
      <div>
        <h1>{this.props.title}</h1>
        {previousProjects.edges.map((edge) => {
          return <ProjectItem key={edge.node.id} project={edge.node} />;
        })}
        {previousProjects.pageInfo.hasNextPage ? (
          <RaisedButton primary onClick={this.loadMore} label="Mer" />
        ) : null}
      </div>
    );
  }
}

export default createRefetchContainer(
  ProjectListPrevious,
  {
    organization: graphql`
      fragment ProjectListPrevious_organization on Organization
        @argumentDefinitions(showProjects: { type: "Int", defaultValue: 10 }) {
        isMember
        previousProjects(first: $showProjects) {
          edges {
            node {
              id
              ...ProjectItem_project
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
  graphql`
    query ProjectListPreviousRefetchQuery($showProjects: Int) {
      organization {
        ...ProjectListPrevious_organization
          @arguments(showProjects: $showProjects)
      }
    }
  `,
);
