import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

import ProjectItem from './ProjectItem';

const PROJECTS_PER_PAGE = 10;

class ProjectListUpcoming extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        organization: PropTypes.object.isRequired,
        relay: PropTypes.object.isRequired,
    }

    loadMore = () => {
        const { nextProjects } = this.props.organization;
        this.props.relay.refetch(() => {
            return {
                showProjects: nextProjects.edges.length + PROJECTS_PER_PAGE,
            };
        });
    }

    render() {
        const { nextProjects } = this.props.organization;
        return (
            <div>
                <h1>{this.props.title}</h1>
                {nextProjects.edges.map((edge) => {
                    return (
                        <ProjectItem
                            key={edge.node.id}
                            project={edge.node}
                            showText
                        />
                    );
                })}
                {nextProjects.pageInfo.hasNextPage
                    ? <RaisedButton primary onClick={this.loadMore} label="Mer" />
                    : null
                }
            </div>
        );
    }
}

export default createRefetchContainer(
    ProjectListUpcoming,
    {
        organization: graphql`
        fragment ProjectListUpcoming_organization on Organization
        @argumentDefinitions(
            showProjects: {type: "Int", defaultValue: 5}
        )
        {
            isMember
            nextProjects(first:$showProjects) {
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
        }`,
    },
    graphql`
    query ProjectListUpcomingRefetchQuery($showProjects: Int) {
        organization {
            ...ProjectListUpcoming_organization @arguments(showProjects: $showProjects)
        }
    }`,
);
