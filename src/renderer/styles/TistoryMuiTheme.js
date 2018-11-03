
const styles = theme => ({
  button: {
    borderRadius: "18px",
    color: "#fff",
    backgroundColor: "#000",
    "&:hover": {
      backgroundColor: "#f54"
    },
    ":disabled": {
      backgroundColor: "#b9b9b9"
    }
  },

  blockCenter: {
    margin: "0 auto"
  },

  blockNoPadding: {
    margin: "0",
    padding: "0"
  },

  layoutRoot: {
    flexGrow: 1
  },

  layoutGrow: {
    flexGrow: 1
  }
})

export default styles
