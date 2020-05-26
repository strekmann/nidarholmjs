import React, { ChangeEvent } from "react";
import matchSorter from "match-sorter";
import TextField from "@material-ui/core/TextField";
import Autocomplete, { GetTagProps } from "@material-ui/lab/Autocomplete";

export interface AutocompleteOptionType {
  id: string;
  label: string;
}

type Props = {
  options: AutocompleteOptionType[],
  label: string,
  fullWidth?: boolean,
  multiple?: boolean,
  onChange: (
    _: any,
    selection: AutocompleteOptionType | string[] | null,
  ) => void,
  onUpdateInput?: (event: ChangeEvent<HTMLInputElement>) => void,
};

export default function (props: Props) {
  return (
    <Autocomplete
      options={props.options}
      onChange={props.onChange}
      getOptionLabel={(option) => option.label}
      getOptionSelected={(option, value) => option.id === value.id}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={props.label}
            onChange={props.onUpdateInput}
            fullWidth={props.fullWidth}
          />
        );
      }}
      filterOptions={(options, { inputValue }) =>
        matchSorter(options, inputValue, { keys: ["label"] })
      }
    />
  );
}
