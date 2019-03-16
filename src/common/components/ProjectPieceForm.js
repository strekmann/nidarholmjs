// @flow

import AutoComplete from "material-ui/AutoComplete";
import Dialog from "material-ui/Dialog";
import React from "react";
import { createRefetchContainer, graphql } from "react-relay";
import type { RelayProp } from "react-relay";

import ProjectPieceFormOrganization from "./__generated__/ProjectPieceForm_organization.graphql";

type Props = {
  open: boolean,
  organization: ProjectPieceFormOrganization,
  relay: RelayProp,
  save: (string) => void,
  toggle: () => void,
};

class ProjectPieceForm extends React.Component<Props> {
  searchPiece = (term) => {
    const { relay } = this.props;
    relay.refetch((variables) => {
      variables.term = term;
      return variables;
    });
  };

  render() {
    const { organization, save, open, toggle } = this.props;
    const { pieces } = organization;
    return (
      <Dialog
        title="Legg til repertoar"
        open={open}
        save={save}
        toggle={toggle}
        autoScrollBodyContent
      >
        <AutoComplete
          floatingLabelText="Navn på stykke / komponist / arrangør"
          dataSource={pieces.edges.map((edge) => {
            const piece = edge.node;
            return {
              text: `${piece.scoreCount}: ${piece.title} - ${
                piece.composers
              } (${piece.arrangers})`,
              value: edge.node,
            };
          })}
          onNewRequest={(chosen) => {
            save(chosen.value);
          }}
          onUpdateInput={(searchTerm) => {
            this.searchPiece(searchTerm);
          }}
          filter={() => {
            return true;
          }}
          fullWidth
          style={{ flexGrow: "1" }}
        />
      </Dialog>
    );
  }
}

export default createRefetchContainer(
  ProjectPieceForm,
  {
    organization: graphql`
      fragment ProjectPieceForm_organization on Organization
        @argumentDefinitions(
          showItems: { type: "Int", defaultValue: 20 }
          term: { type: "String", defaultValue: "" }
        ) {
        id
        isMusicAdmin
        memberGroup {
          id
        }
        pieces(first: $showItems, term: $term) {
          edges {
            node {
              id
              title
              subtitle
              composers
              arrangers
              scoreCount
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
  graphql`
    query ProjectPieceFormRefetchQuery($showItems: Int, $term: String) {
      organization {
        ...ProjectPieceForm_organization
          @arguments(showItems: $showItems, term: $term)
      }
    }
  `,
);
