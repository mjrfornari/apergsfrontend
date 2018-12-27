import React, { Component } from 'react';
import '../css/Default.css';
import Downshift from 'downshift'
import { removeAcento } from '../Utils'




class Autocomplete extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            selected: 'Nenhum',
        };
    }


    render() {
        let items = this.props.items || [];
        let selected = this.props.selected || [];
        let inModal = this.props.inModal || '';
        let select = this.props.select || (() => {});
        let field = this.props.field || '';
        return(
            <div>
                <Downshift 
                    onChange={selection => {
                        select(selection)
                    }}
                    itemToString={item => (item ? item.display : '')}
                    selectedItem={selected}
                    inputId={'input'+field}
                    // selectedItemChanged={(prevItem, item) => {
                    //     this.clearInput(prevItem, item)
                    // }}

                    
                >
                    {({
                    getInputProps,
                    getItemProps,
                    getToggleButtonProps,
                    getLabelProps,
                    getMenuProps,
                    isOpen,
                    inputValue,
                    highlightedIndex,
                    selectedItem,
                    }) => (
                    <div>
                        <div>
                            <div className={"autocomplete-input"}>
                                <input id={'input'+field} className={"form-control form-control"+inModal} {...getInputProps()}/>
                            </div>
                            <div>
                                <button className={'autocomplete-toggle'+inModal} {...getToggleButtonProps({
                                        'aria-label': isOpen ? 'close.menu' : 'open.menu',
                                    })}>{isOpen ? '▲' : '▼'}</button>
                            </div>
                        </div>
                        <input id={field} name={field} className={'autocomplete-fieldInput'} value={(selectedItem||'').value}/>
                        <ul {...getMenuProps()} className={isOpen ? "autocomplete"+inModal : ''}>
                        {isOpen
                            ? items
                                .filter(item => !removeAcento(inputValue || '') || removeAcento(item.display).includes(removeAcento(inputValue || '')))
                                .slice(0,10)
                                .map((item, index) => {return(
                                <li className={"autocomplete-list"+inModal}
                                    {...getItemProps({
                                    key: index,
                                    index,
                                    item,
                                    style: {
                                        backgroundColor: (selectedItem === item) || (highlightedIndex === index) ? 'var(--autocomplete-selected-background'+inModal+')' : 'var(--autocomplete-background'+inModal+')',
                                        color: (selectedItem === item) || (highlightedIndex === index) ? 'var(--autocomplete-selected-font'+inModal+')' :  'var(--autocomplete-font'+inModal+')',
                                        textAlign: 'left'
                                    },
                                    })}
                                >
                                    <p className={'autocomplete-text'+inModal}>{(selectedItem === item) ? '✓ '+item.display : item.display}</p>
                                </li>
                                )})
                            : null}
                        </ul>
                    </div>
                    )}
                </Downshift>
            </div>
        )
    }
}

export default Autocomplete;
