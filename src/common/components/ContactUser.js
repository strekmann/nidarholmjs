import { Card, CardActions, CardHeader, CardMedia, CardTitle } from 'material-ui/Card';
import { ListItem } from 'material-ui/List';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import ShowContactInfoMutation from '../mutations/ShowContactInfo';

import Email from './Email';
import Phone from './Phone';

class ContactUser extends React.Component {
    static propTypes = {
        relay: PropTypes.object.isRequired,
        role: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
    }

    state = {
        email: '',
        phone: '',
        show: false,
    }

    showContactInfo = () => {
        const { relay, user } = this.props;
        this.setState({ show: true });
        ShowContactInfoMutation.commit(
            relay.environment,
            {
                userId: user.id,
            },
            (results) => {
                this.setState({
                    email: results.showContactInfo.user.email,
                    phone: results.showContactInfo.user.phone,
                });
            },
        );
    }

    render() {
        const { role, user } = this.props;
        return (
            <Card style={{ width: 220, marginBottom: 15 }}>
                <CardHeader title={role.name} textStyle={{ paddingRight: 0, fontFamily: 'Montserrat, serif' }} />
                <CardTitle title={user.name} />
                <CardMedia>
                    {user.profilePicture && user.profilePicture.thumbnailPath
                        ? <img src={user.profilePicture.thumbnailPath} alt="" />
                        : null
                    }
                </CardMedia>
                {this.state.show
                    ? (
                        <CardActions>
                            {this.state.phone
                                ? (
                                    <ListItem>
                                        <Phone phone={this.state.phone} />
                                    </ListItem>
                                )
                                : null
                            }
                            {this.state.email
                                ? (
                                    <ListItem>
                                        <Email email={this.state.email} />
                                    </ListItem>
                                )
                                : null
                            }
                        </CardActions>
                    )
                    : (
                        <CardActions>
                            <FlatButton
                                onClick={() => {
                                    this.showContactInfo(user);
                                }}
                                label="Vis kontaktinfo"
                            />
                        </CardActions>
                    )
                }
            </Card>
        );
    }
}

export default createFragmentContainer(
    ContactUser,
    {
        user: graphql`
        fragment ContactUser_user on User
        @argumentDefinitions(
            showDetails: {type: "Boolean", defaultValue: false}
        )
        {
            id
            name
            profilePicture {
                thumbnailPath
            }
        }`,
    },
);