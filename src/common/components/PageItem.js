import React from 'react';
import { Link } from 'react-router';

import PermissionChips from './PermissionChips';
import DateFromNow from './DateFromNow';
import { flattenPermissions } from '../utils';

export default class PageItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        slug: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        title: React.PropTypes.string,
        summary: React.PropTypes.string,
        permissions: React.PropTypes.object,
        memberGroupId: React.PropTypes.string,
        creator: React.PropTypes.object,
        created: React.PropTypes.string,
        updator: React.PropTypes.object,
        updated: React.PropTypes.string,
        savePage: React.PropTypes.func,
    }

    render() {
        return (
            <div>
                <h3><Link to={`/${this.props.slug}`}>{this.props.slug}</Link></h3>
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
