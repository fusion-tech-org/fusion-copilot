#!/bin/sh

tpid=`ps -ef|grep lowcode-app.jar|grep -v grep|grep -v kill|awk '{print $2}'`

echo $tpid