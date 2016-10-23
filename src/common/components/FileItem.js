import React from 'react';
import { Link } from 'react-router';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import Download from 'material-ui/svg-icons/file/file-download';
import { grey400 } from 'material-ui/styles/colors';
import PermissionChips from './PermissionChips';
import { flattenPermissions } from '../utils';

export default class FileItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        filename: React.PropTypes.string,
        created: React.PropTypes.string,
        mimetype: React.PropTypes.string,
        size: React.PropTypes.number,
        tags: React.PropTypes.array,
        permissions: React.PropTypes.object.isRequired,
        memberGroupId: React.PropTypes.string,
        is_image: React.PropTypes.bool,
        normal_path: React.PropTypes.string,
        path: React.PropTypes.string,
    }

    render() {
        return (
            <Card key={this.props.id} style={{ width: 200, margin: '0 15px 15px 15px' }} >
                <CardTitle>
                    <Link
                        style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: 170,
                            display: 'inline-block',
                        }}
                    >
                        {this.props.filename}
                    </Link>
                </CardTitle>
                {this.props.is_image
                    ? <CardMedia><img alt="" src={this.props.normal_path} /></CardMedia>
                    : <Link
                        style={{ display: 'block', textAlign: 'center' }}
                        href={this.props.path}
                        download
                    >
                        <Download style={{ height: 100, width: '100%' }} color={grey400} />
                    </Link>
                    }
                <CardText>
                    <PermissionChips
                        memberGroupId={this.props.memberGroupId}
                        permissions={flattenPermissions(this.props.permissions)}
                    />
                </CardText>
            </Card>
        );
    }
}
