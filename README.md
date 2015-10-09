# HEPS data set

All the details are in [our paper](http://www.vldb.org/pvldb/vol8/p1606-manabe.pdf).

## It contains

* *Training* data set
* *Test* data set
* *Agreement* data set annotated by *B*
* A few other pages

## It does not contain

* *Raw strings* (because of copyright problem)
* Pages with problems (as far as we found), e.g.,
    * Pages currently not downloadable from Internet Archive
	* Pages that download the latest contents from outside the archive

## download.rb

* downloads and generates raw strings and HTML files containing only *content bodies*.
* Usage:
```
$ ruby download.rb <path_to_PhantomJS_binary> ./data-set ./html-dir
```
* It is developed using:
	* CentOS release 6.5
	* Ruby 2.1.2p95
	* PhantomJS 2.0.1-development

## Note

* *Mandatory* attribute value of a range is false iff the range is a *transition*.

## Link

* [Reference implementation of *HEPS*](https://github.com/tmanabe/HEPS)
