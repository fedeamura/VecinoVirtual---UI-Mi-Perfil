import React from "react";

//Styles
import { withStyles } from "@material-ui/core/styles";
import styles from "./styles";

//Componentes
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import _ from "lodash";

import { Dialog, DialogContent, DialogActions, DialogTitle } from "@material-ui/core";

const url = "https://i.imgur.com/8AInVS7.jpg";

class Dialogo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Dialog onClose={this.props.onClose} open={this.props.visible || false}>
        <DialogTitle>Número de trámite de su DNI</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Su número de trámite se encuentra en su tarjeta de DNI. Asegúrese de ingresar el número correspondiente al último ejemplar de su
            DNI. Solo debe ingresar la primer linea.{" "}
          </Typography>
          <div
            style={{
              marginTop: 16,
              backgroundImage: `url(${url})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "100%",
              minWidth: 400,
              minHeight: 300,
              maxHeight: 300
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={this.props.onClose}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

let componente = Dialogo;
componente = withStyles(styles)(componente);
export default componente;
