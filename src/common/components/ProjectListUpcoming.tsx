import { RelayRefetchProp } from "react-relay";
import Button from "@material-ui/core/Button";
import React from "react";
import { createRefetchContainer, graphql } from "react-relay";

import ProjectItem from "./ProjectItem";
import { ProjectListUpcoming_organization } from "./__generated__/ProjectListUpcoming_organization.graphql";

const PROJECTS_PER_PAGE = 5;

type Props = {
  title: string;
  organization: ProjectListUpcoming_organization;
  relay: RelayRefetchProp;
};

class ProjectListUpcoming extends React.Component<Props> {
  loadMore = () => {
    const { nextProjects } = this.props.organization;
    this.props.relay.refetch(() => {
      return {
        showProjects: nextProjects?.edges?.length ?? 0 + PROJECTS_PER_PAGE,
      };
    });
  };

  render() {
    const { nextProjects } = this.props.organization;
    if (nextProjects == null) {
      return <div>Ingen prosjekter på planen</div>;
    }
    return (
      <div>
        <h1>{this.props.title}</h1>
        {nextProjects.edges?.map((edge) => {
          return (
            <ProjectItem key={edge?.node?.id} project={edge?.node} showText />
          );
        })}
        {nextProjects.pageInfo.hasNextPage ? (
          <Button variant="contained" color="primary" onClick={this.loadMore}>
            Mer
          </Button>
        ) : null}
      </div>
    );
  }
}

export default createRefetchContainer(
  ProjectListUpcoming,
  {
    organization: graphql`
      fragment ProjectListUpcoming_organization on Organization
      @argumentDefinitions(showProjects: { type: "Int", defaultValue: 5 }) {
        isMember
        nextProjects(first: $showProjects) {
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
    query ProjectListUpcomingRefetchQuery($showProjects: Int) {
      organization {
        ...ProjectListUpcoming_organization
          @arguments(showProjects: $showProjects)
      }
    }
  `,
);
