import Person from 'material-ui/svg-icons/social/person';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';

class ProfilePicture extends React.Component {
    static propTypes = {
        user: React.PropTypes.object,
    }
    render() {
        const { user } = this.props;
        if (user.profilePicture) {
            return (
                <img
                    src={user.profilePicture.normalPath}
                    alt={`Bilde av ${user.name}`}
                    className="responsive"
                />
            );
        }
        return (
            <Person alt={`Bilde av ${user.name}`} style={{ height: 100, width: '100%', color: theme.palette.pickerHeaderColor }} />
        );
    }
}

export default Relay.createContainer(ProfilePicture, {
    fragments: {
        user: () => {
            return Relay.QL`
            fragment on User {
                id
            }`;
        },
    },
});
