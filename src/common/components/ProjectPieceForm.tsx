import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import React from "react";
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay";
import Autocomplete, { AutocompleteOptionType } from "./Autocomplete";
import { ProjectPieceForm_organization } from "./__generated__/ProjectPieceForm_organization.graphql";

type Props = {
  open: boolean,
  organization: ProjectPieceForm_organization,
  relay: RelayRefetchProp,
  save: any,
  onClose: () => void,
};

class ProjectPieceForm extends React.Component<Props> {
  searchPiece = (term: string) => {
    this.props.relay.refetch((variables) => {
      variables.term = term;
      return variables;
    });
  };

  addPiece = (_: any, selection: AutocompleteOptionType | null) => {
    if (selection) {
      this.props.save(selection.id);
    }
  };

  render() {
    const { pieces } = this.props.organization;
    return (
      <Dialog open={this.props.open} onClose={this.props.onClose}>
        <DialogTitle>Legg til reperotar</DialogTitle>
        <DialogContent>
          <Autocomplete
            label="Navn på stykke / komponist / arrangør"
            options={pieces.edges.map((edge) => {
              const piece = edge.node;
              return {
                label: `${piece.scoreCount}: ${piece.title} - ${piece.composers} (${piece.arrangers})`,
                id: piece.id,
              };
            })}
            onChange={this.addPiece}
            onUpdateInput={(event: React.ChangeEvent<HTMLInputElement>) => {
              this.searchPiece(event.target.value);
            }}
            fullWidth
          />
        </DialogContent>
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
