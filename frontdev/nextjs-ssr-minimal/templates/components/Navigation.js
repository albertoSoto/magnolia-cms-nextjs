import React from 'react';
import Link from 'next/link';
import { languages } from '../../utils';

let NODE_NAME;
let BASENAME = '';

function renderLink(item) {
  if (!item){
    return <>Empty!</>
  }
  console.log("THIS IS IT")
  console.log(item)
  let linkData = BASENAME + item && item['@path']?item['@path'].replace(NODE_NAME, ''):"";
  return (
    <React.Fragment key={item['@id']}>
      <Link href={ linkData || '/'} >
        <a>{item['@name']}</a>
      </Link>
      {item['@nodes'] && item['@nodes'].length > 0 && item['@nodes'].map((nodeName) => renderLink(item[nodeName]))}
    </React.Fragment>
  );
}

function Navigation(props) {
  const { content, nodeName, currentLanguage, basename } = props;

  NODE_NAME = nodeName;
  BASENAME = basename;

  return (
    <nav>
      {renderLink(content, currentLanguage)}
      {languages.map((language, i) => (
        <button onClick={() => (window.location.href = '/' + (i === 0 ? '' : language))} key={language}>{language}</button>
      ))}
    </nav>
  );
}

export default Navigation;
