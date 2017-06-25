/* global FormData */

import axios from 'axios';
import IconButton from 'material-ui/IconButton';
import Person from 'material-ui/svg-icons/social/person';
import Camera from 'material-ui/svg-icons/image/photo-camera';
import PropTypes from 'prop-types';
import React from 'react';
import Dropzone from 'react-dropzone';
import Relay from 'react-relay';

import theme from '../theme';
import SetProfilePictureMutation from '../mutations/setProfilePicture';

class ProfilePicture extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        user: PropTypes.object,
        isViewer: PropTypes.bool,
        isAdmin: PropTypes.bool,
    }

    onDrop = (files) => {
        const { user } = this.props;
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new SetProfilePictureMutation({
                    hash: response.data.hex,
                    mimetype: response.data.mimetype,
                    size: response.data.size,
                    user,
                }));
            });
        });
    }

    render() {
        const {
            user,
            isViewer,
            isAdmin,
        } = this.props;
        if (isViewer || isAdmin) {
            return (
                <Dropzone
                    onDrop={this.onDrop}
                    style={{
                        maxWidth: '100%',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        {user.profilePicture
                            ? <img
                                src={user.profilePicture.normalPath}
                                alt={`Bilde av ${user.name}`}
                                className="responsive"
                            />
                            : <Person alt={`Bilde av ${user.name}`} style={{ height: 100, width: '100%', color: theme.palette.pickerHeaderColor }} />
                        }
                        <div style={{ position: 'absolute', bottom: 0 }}>
                            <IconButton>
                                <Camera color={theme.palette.alternateTextColor} />
                            </IconButton>
                        </div>
                    </div>
                </Dropzone>
            );
        }
        return (
            <div>
                {user.profilePicture
                    ? <img
                        src={user.profilePicture.normalPath}
                        alt={`Bilde av ${user.name}`}
                        className="responsive"
                    />
                    : <Person alt={`Bilde av ${user.name}`} style={{ height: 100, width: '100%', color: theme.palette.pickerHeaderColor }} />
                }
            </div>
        );
    }
}

export default Relay.createContainer(ProfilePicture, {
    fragments: {
        user: () => {
            return Relay.QL`
            fragment on User {
                id
                name
                profilePicture {
                    normalPath
                }
                ${SetProfilePictureMutation.getFragment('user')}
            }`;
        },
    },
});
