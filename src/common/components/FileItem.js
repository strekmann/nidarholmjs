import React from 'react';
import { Link } from 'react-router';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import Download from 'material-ui/svg-icons/file/file-download';
import PermissionChips from './PermissionChips';

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
    }

    render() {
        return (
            <Card key={this.props.id}>
                <CardTitle><Link>{this.props.filename}</Link></CardTitle>
                {this.props.is_image ?
                    <CardMedia><img alt="" src={this.props.normal_path} /></CardMedia>
                    : <RaisedButton icon={<Download />} label="Last ned" />}
                <CardText>
                    <PermissionChips
                        memberGroupId={this.props.memberGroupId}
                        {...this.props.permissions}
                    />
                </CardText>
            </Card>
        );
    }
}
