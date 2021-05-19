import React, { useEffect, useState } from 'react'
import { Chip, TextField } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import update from 'immutability-helper'

const useListStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  }
}))

function ChipInputTextField({label, placeholder, onAdd}) {
  function handleAdd(e) {
    onAdd(e.target.value.trim())
    e.target.value = ''
  }

  function handleInputKeyDown(e) {
    if ([9, 13, 188].find(v => v == e.keyCode)) {
      e.preventDefault()
      handleAdd(e)
      return
    }
  }

  function handleInputBlur(e) {
    handleAdd(e)
  }

  return (
    <TextField
      label={label} placeholder={placeholder}
      fullWidth
      onKeyDown={handleInputKeyDown}
      onBlur={handleInputBlur}
    />
  )
}


function ChipList({values, onDelete}) {
  const classes = useListStyles()
  return (
    <div className={classes.root}>
      {values.map(value =>
        <Chip
          key={value}
          label={value}
          onDelete={() => onDelete(value)}
        />
      )}
    </div>
  )
}


export default function ChipInput({label, placeholder, defaultValue, onChange}) {
  const [chips, setChips] = useState(defaultValue || [])

  function handleAdd(value) {
    if (value == '') {
      return
    }

    setChips(update(chips, {
      $push: [value]
    }))
  }

  function handleDelete(value) {
    let index = chips.findIndex(chip => chip == value)
    setChips(update(chips, {
      $splice: [[index, 1]]
    }))
  }

  useEffect(() => {
    onChange(chips)
  }, [chips])


  return (
    <>
      <ChipInputTextField
        label={label} placeholder={placeholder}
        onAdd={handleAdd}
      />

      <ChipList
        values={chips}
        onDelete={handleDelete}
      />
      
    </>
  )
}
