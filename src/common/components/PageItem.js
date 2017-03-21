import React from 'react';
import { Link } from 'react-router';
import { flattenPermissions } from '../utils';
import PermissionChips from './PermissionChips';
import DateFromNow from './DateFromNow';

export default class PageItem extends React.Component {
    static propTypes = {
        slug: React.PropTypes.string,
        title: React.PropTypes.string,
        permissions: React.PropTypes.object,
        memberGroupId: React.PropTypes.string,
        creator: React.PropTypes.object,
        created: React.PropTypes.string,
        updator: React.PropTypes.object,
        updated: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <h3>
                    <Link to={`/${this.props.slug}`}>
                        {this.props.slug}
                        {this.props.title
                            ? <span> ({this.props.title})</span>
                            : null
                        }
                    </Link>
                </h3>
                <p>
                    Oppdatert for <DateFromNow date={this.props.updated} />
                    {' '}
                    av {this.props.updator && this.props.updator.name}
                    {' '}
                    (Laget for <DateFromNow date={this.props.created} />
                    {' '}
                    av {this.props.creator && this.props.creator.name})
                </p>
                <PermissionChips
                    memberGroupId={this.props.memberGroupId}
                    permissions={flattenPermissions(this.props.permissions)}
                />
            </div>
        );
    }
}
