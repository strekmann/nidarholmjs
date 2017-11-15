import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

import Email from './Email';
import Phone from './Phone';

class ContactUser extends React.Component {
    static propTypes = {
        relay: PropTypes.object.isRequired,
        role: PropTypes.object.isRequired,
        user: PropTypes.object.isRequired,
    }

    showContactInfo = () => {
        this.props.relay.refetch(() => {
            return {
                showDetails: true,
            };
        });
    }

    render() {
        const { role, user } = this.props;
        return (
            <Card style={{ width: 220, marginBottom: 15 }}>
                <CardHeader title={role.name} textStyle={{ paddingRight: 0 }} />
                <CardMedia>
                    {user.profilePicture && user.profilePicture.thumbnailPath
                        ? <img src={user.profilePicture.thumbnailPath} alt="" />
                        : null
                    }
                </CardMedia>
                <CardTitle title={user.name} />
                {user.phone || user.email
                    ? <CardText style={{ paddingTop: 0 }}>
                        <div className="noMargins">
                            <div>
                                <Phone phone={user.phone} />
                            </div>
                            <div>
                                <Email email={user.email} />
                            </div>
                        </div>
                    </CardText>
                    : null
                }
                {!user.phone && !user.email
                    ? <CardActions>
                        <FlatButton
                            onClick={() => {
                                this.showContactInfo(user);
                            }}
                            label="Vis kontaktinfo"
                        />
                    </CardActions>
                    : null
                }
            </Card>
        );
    }
}

export default createRefetchContainer(
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
    /* complains about user unknown on Root
    graphql`
    query ContactUserRefetchQuery($showDetails: Boolean) {
        user {
            ...ContactUser_user @arguments(showDetails: $showDetails)
        }
    }`,
    */
);
