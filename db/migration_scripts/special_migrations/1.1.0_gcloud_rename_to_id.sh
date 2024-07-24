#!/bin/bash

THIS_SCRIPT_DIR=$(dirname $0)
SCRIPT_PATH="${THIS_SCRIPT_DIR}/../../../tools/db/rename_to_id/rename_to_id"
echo $SCRIPT_PATH
python $SCRIPT_PATH -y
