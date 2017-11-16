/* global FormData */

import axios from 'axios';
import IconButton from 'material-ui/IconButton';
import Person from 'material-ui/svg-icons/social/person';
import Camera from 'material-ui/svg-icons/image/photo-camera';
import PropTypes from 'prop-types';
import React from 'react';
import Dropzone from 'react-dropzone';
import { createFragmentContainer, graphql } from 'react-relay';

import theme from '../theme';
import SetProfilePictureMutation from '../mutations/SetProfilePicture';

class ProfilePicture extends React.Component {
    static propTypes = {
        isViewer: PropTypes.bool,
        isAdmin: PropTypes.bool,
        relay: PropTypes.object.isRequired,
        user: PropTypes.object,
    }

    onDrop = (files) => {
        const { relay, user } = this.props;
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data).then((response) => {
                SetProfilePictureMutation.commit(
                    relay.environment,
                    {
                        hash: response.data.hex,
                        mimetype: response.data.mimetype,
                        size: response.data.size,
                        userId: user.id,
                    },
                );
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

export default createFragmentContainer(
    ProfilePicture,
    {
        user: graphql`
        fragment ProfilePicture_user on User {
            id
            name
            profilePicture {
                normalPath
            }
        }`,
    },
);
