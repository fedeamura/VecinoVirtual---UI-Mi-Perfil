const styles = theme => {
  return {
    toolbar: {
      backgroundColor: "white",
      "& h2": {
        color: "black"
      },
      "& h3": {
        color: "black"
      }
    },
    contentClassNames: {
      padding: theme.spacing.unit * 2,
      display: "flex",
      flexDirection: "column"
    },
    contenedorFoto: {
      minHeight: "fit-content",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      margin: theme.spacing.unit * 2,
      opacity: 0,
      transition: "all 0.3s",
      transform:'translateY(50px)',
      "&.visible": {
        opacity: 1,
        transform:'translateY(0px)',
      }
    },
    fotoPerfil: {
      "& img": {
        backgroundColor:'rgba(0,0,0,0.1)',
        position: "absolute"
      },
      width: "150px",
      height: "150px",
      minWidth: "150px",
      minHeight: "150px"
    },
    textoNombre: {
      marginTop: theme.spacing.unit * 2
    },
    cardRoot: {
      width: "100%",
      marginTop: theme.spacing.unit * 4,
      alignSelf: "center",
      opacity: 0,
      transition: "all 0.3s",
      transform:'translateY(50px)',
      "&.visible": {
        opacity: 1,
        transform:'translateY(0px)',
      }
    },
    logoMuni: {
      marginRight: "16px",
      backgroundPosition: "center",
      minWidth: "56px",
      maxWidth: "56px",
      minHeight: "56px",
      maxHeight: "56px",
      backgroundRepeat: "no-repeat",
      backgroundSize: "contain",
      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
        minWidth: "126px",
        maxWidth: "126px"
      }
    },
    toolbarLeftIcon: {
      color: "black"
    },
    contenedorTextos: {
      padding: theme.spacing.unit * 2
    },
    contenedorBotones: {
      borderTop: "1px solid rgba(0,0,0,0.1)",
      padding: theme.spacing.unit * 2,
      display: "flex",
      alignItems: "flex-end",
      width: "100%",
      justifyContent: "flex-end"
    }
  };
};
export default styles;
