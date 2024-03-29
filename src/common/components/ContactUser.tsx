import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import ShowContactInfoMutation from "../mutations/ShowContactInfo";
import Email from "./Email";
import Phone from "./Phone";
import { ContactUser_user } from "./__generated__/ContactUser_user.graphql";
import { ShowContactInfoMutationResponse } from "../mutations/__generated__/ShowContactInfoMutation.graphql";

type Props = {
  relay: RelayProp;
  role: {
    name: string;
  };
  user: ContactUser_user;
};

type State = {
  email: string | null;
  phone: string | null;
  show: boolean;
};

class ContactUser extends React.Component<Props, State> {
  state = {
    email: "",
    phone: "",
    show: false,
  };

  showContactInfo = () => {
    const { relay, user } = this.props;
    this.setState({ show: true });
    ShowContactInfoMutation.commit(
      relay.environment,
      {
        userId: user.id,
      },
      (results: ShowContactInfoMutationResponse) => {
        this.setState({
          email: results.showContactInfo.user.email,
          phone: results.showContactInfo.user.phone,
        });
      },
    );
  };

  render() {
    const { role, user } = this.props;
    return (
      <Card style={{ width: 220, marginBottom: 15 }}>
        <CardHeader
          title={user.name}
          subheader={role.name}
          titleTypographyProps={{ variant: "h6", style: { minHeight: 64 } }}
        />
        <CardMedia>
          {user.profilePicture && user.profilePicture.thumbnailPath ? (
            <img src={user.profilePicture.thumbnailPath} alt="" />
          ) : null}
        </CardMedia>
        {this.state.show ? (
          <CardActions className="contact-info">
            <List>
              {this.state.phone ? (
                <ListItem>
                  <Phone phone={this.state.phone} />
                </ListItem>
              ) : null}
              {this.state.email ? (
                <ListItem>
                  <Email email={this.state.email} />
                </ListItem>
              ) : null}
            </List>
          </CardActions>
        ) : (
          <CardActions>
            <Button
              onClick={() => {
                this.showContactInfo();
              }}
              variant="contained"
            >
              Vis kontaktinfo
            </Button>
          </CardActions>
        )}
      </Card>
    );
  }
}

export default createFragmentContainer(ContactUser, {
  user: graphql`
    fragment ContactUser_user on User # @argumentDefinitions(
    # showDetails: { type: "Boolean", defaultValue: false }
    #)
    {
      id
      name
      profilePicture {
        thumbnailPath
      }
    }
  `,
});
