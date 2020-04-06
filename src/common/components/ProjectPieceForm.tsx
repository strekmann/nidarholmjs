import AutoComplete from "material-ui/AutoComplete";
import Dialog from "material-ui/Dialog";
import React from "react";
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay";

import { ProjectPieceForm_organization } from "./__generated__/ProjectPieceForm_organization";

type Props = {
  open: boolean;
  organization: ProjectPieceForm_organization;
  relay: RelayRefetchProp;
  save: any;
  toggle: any;
};

class ProjectPieceForm extends React.Component<Props> {
  searchPiece = (term) => {
    this.props.relay.refetch((variables) => {
      variables.term = term;
      return variables;
    });
  };

  render() {
    const { pieces } = this.props.organization;
    return (
      <Dialog
        title="Legg til reperotar"
        open={this.props.open}
        save={this.props.save}
        toggle={this.props.toggle}
        autoScrollBodyContent
      >
        <AutoComplete
          floatingLabelText="Navn på stykke / komponist / arrangør"
          dataSource={pieces.edges.map((edge) => {
            const piece = edge.node;
            return {
              text: `${piece.scoreCount}: ${piece.title} - ${piece.composers} (${piece.arrangers})`,
              value: edge.node,
            };
          })}
          onNewRequest={(chosen) => {
            this.props.save(chosen.value);
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
