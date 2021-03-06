import * as React from "react";

type Props = {
  phone: string;
};

export default class Phone extends React.Component<Props> {
  render() {
    const { phone } = this.props;
    if (!phone) {
      return <span />;
    }
    const cl = phone.replace(/ /g, ""); // cleaned
    let pretty = cl;
    let full = cl;
    if (cl.length === 8) {
      if (cl[0] === "9" || cl[0] === "4") {
        pretty = `${cl[0]}${cl[1]}${cl[2]} ${cl[3]}${cl[4]} ${cl[5]}${cl[6]}${cl[7]}`;
      } else {
        pretty = `${cl[0]}${cl[1]} ${cl[2]}${cl[3]} ${cl[4]}${cl[5]} ${cl[6]}${cl[7]}`;
      }
      full = `+47${full}`;
    }
    return (
      <a href={`tel:${full}`} style={{ whiteSpace: "nowrap" }}>
        {pretty}
      </a>
    );
  }
}
