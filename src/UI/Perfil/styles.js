const imagenSoloLogo = require("../../_Resources/imagenes/escudo_muni_verde.png");
const maxWidth = "800px";

const styles = theme => {
  return {
    opacityView: {
      transition: "all 0.3s",
      opacity: 0,
      pointerEvents: "none",
      "&.visible": {
        opacity: 1,
        pointerEvents: "all"
      }
    },
    root: {
      display: "flex",
      position: "relative",
      // justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflow: "auto"
    },
    panelVerde: {
      position: "absolute",
      width: "100%",
      backgroundColor: theme.palette.primary.main,
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      "& > div": {
        width: "100%",
        transition: "all 0.3s",
        height: "166px",
        position: "relative",
        maxWidth: maxWidth,
        [theme.breakpoints.up("sm")]: {
          height: "300px"
        }
      }
    },
    contenedorMuni: {
      display: "flex",
      alignItems: "center",
      position: "absolute",
      bottom: "112px"
    },
    logoMuni: {
      backgroundImage: `url(${imagenSoloLogo})`,
      filter: "saturate(0%) brightness(0) invert(100%)",
      width: "40px",
      height: "40px",
      marginLeft: theme.spacing.unit * 2,
      marginRight: theme.spacing.unit,
      backgroundPosition: "center",
      backgroundSize: "contain",
      backgroundRepeat: "no-repeat",
      [theme.breakpoints.up("sm")]: {
        // backgroundImage: `url(${imagenLogo})`,
        marginRight: theme.spacing.unit * 2,
        width: "60px",
        height: "60px"
      }
    },
    tituloVecinoVirtual: {
      color: "white",
      fontSize: 26
    },
    panelContenido: {
      marginTop: "72px",
      width: "100%",
      maxWidth: maxWidth,
      bottom: "-16px",
      // padding: theme.spacing.unit * 2,
      // overflow: "auto",
      [theme.breakpoints.up("sm")]: {
        marginTop: "202px"
      },
      // transform: "translateY(300px)",
      opacity: 0,
      transition: "all 0.3s",
      "&.visible": {
        transform: "translateY(0px)",
        opacity: 1
      },
      "& .titulo": {
        fontSize: 20,
        marginTop: "16px",
        marginBottom: "16px",
        textAlign: "center"
      }
    },
    contenedorFoto: {
      marginTop: theme.spacing.unit * 4,
      marginBottom: theme.spacing.unit * 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      "& *": {
        cursor: "pointer"
      },
      "& .foto": {
        borderRadius: "156px",
        width: "156px",
        height: "156px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& > div": {
          transition: "all 0.3s",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          borderRadius: "156px",
          width: "156px",
          height: "156px",
          position: "absolute"
        },
        "& > .texto": {
          transition: "all 0.3s",
          opacity: 0,
          zIndex: 1,
          color: "black"
        },
        "&:hover": {
          "& > div": {
            opacity: 0.2
          },
          "& > .texto": {
            opacity: 1
          }
        }
      },
      "& .nombre": {
        marginTop: theme.spacing.unit * 2
      }
    },
    card: {
      backgroundColor: "white",
      borderRadius: "16px",
      boxShadow: "0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12), 0 2px 4px -1px rgba(0,0,0,0.3)"
    },
    cardDatosPersonales: {
      padding: theme.spacing.unit * 2
    },
    cardDatosAcceso: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4
    },
    cardDatosDeContacto: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4
    },
    cardDatosDomicilio: {
      padding: theme.spacing.unit * 2,
      marginTop: theme.spacing.unit * 4,
      marginBottom: theme.spacing.unit * 4
    },
    contenedorError: {
      borderRadius: theme.spacing.unit
    },
    contenedorBotones: {
      display: "flex",
      marginTop: theme.spacing.unit * 2,
      borderTop: "1px solid rgba(0,0,0,0.1)",
      paddingTop: theme.spacing.unit * 2,
      alignItems: "flex-end",
      justifyContent: "flex-end"
    }
  };
  // return {
  //   toolbar: {
  //     backgroundColor: "white",
  //     "& h2": {
  //       color: "black"
  //     },
  //     "& h3": {
  //       color: "black"
  //     }
  //   },
  //   contentClassNames: {
  //     padding: theme.spacing.unit * 2,
  //     display: "flex",
  //     flexDirection: "column"
  //   },
  //   contenedorFoto: {
  //     minHeight: "fit-content",
  //     display: "flex",
  //     flexDirection: "column",
  //     alignItems: "center",
  //     justifyContent: "center",
  //     margin: theme.spacing.unit * 2,
  //     opacity: 0,
  //     transition: "all 0.3s",
  //     transform:'translateY(50px)',
  //     "&.visible": {
  //       opacity: 1,
  //       transform:'translateY(0px)',
  //     }
  //   },
  //   fotoPerfil: {
  //     "& img": {
  //       backgroundColor:'rgba(0,0,0,0.1)',
  //       position: "absolute"
  //     },
  //     width: "150px",
  //     height: "150px",
  //     minWidth: "150px",
  //     minHeight: "150px"
  //   },
  //   textoNombre: {
  //     marginTop: theme.spacing.unit * 2
  //   },
  //   cardRoot: {
  //     width: "100%",
  //     marginTop: theme.spacing.unit * 4,
  //     alignSelf: "center",
  //     opacity: 0,
  //     transition: "all 0.3s",
  //     transform:'translateY(50px)',
  //     "&.visible": {
  //       opacity: 1,
  //       transform:'translateY(0px)',
  //     }
  //   },
  //   logoMuni: {
  //     marginRight: "16px",
  //     backgroundPosition: "center",
  //     minWidth: "56px",
  //     maxWidth: "56px",
  //     minHeight: "56px",
  //     maxHeight: "56px",
  //     backgroundRepeat: "no-repeat",
  //     backgroundSize: "contain",
  //     [theme.breakpoints.up("md")]: {
  //       flexDirection: "row",
  //       minWidth: "126px",
  //       maxWidth: "126px"
  //     }
  //   },
  //   toolbarLeftIcon: {
  //     color: "black"
  //   },
  //   contenedorTextos: {
  //     padding: theme.spacing.unit * 2
  //   },
  //   contenedorBotones: {
  //     borderTop: "1px solid rgba(0,0,0,0.1)",
  //     padding: theme.spacing.unit * 2,
  //     display: "flex",
  //     alignItems: "flex-end",
  //     width: "100%",
  //     justifyContent: "flex-end"
  //   }
  // };
};
export default styles;
