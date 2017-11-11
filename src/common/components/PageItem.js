import Link from 'found/lib/Link';
import PropTypes from 'prop-types';
import React from 'react';

import { flattenPermissions } from '../utils';

import PermissionChips from './PermissionChips';
import DateFromNow from './DateFromNow';

export default class PageItem extends React.Component {
    static propTypes = {
        slug: PropTypes.string,
        title: PropTypes.string,
        permissions: PropTypes.object,
        memberGroupId: PropTypes.string,
        creator: PropTypes.object,
        created: PropTypes.string,
        updator: PropTypes.object,
        updated: PropTypes.string,
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
