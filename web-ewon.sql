/*
 Navicat Premium Data Transfer

 Source Server         : sql_ldg
 Source Server Type    : MySQL
 Source Server Version : 100432 (10.4.32-MariaDB)
 Source Host           : localhost:3306
 Source Schema         : web-ewon

 Target Server Type    : MySQL
 Target Server Version : 100432 (10.4.32-MariaDB)
 File Encoding         : 65001

 Date: 19/01/2026 16:16:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ewon_history
-- ----------------------------
DROP TABLE IF EXISTS `ewon_history`;
CREATE TABLE `ewon_history`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `tag_value` double NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_tag_time`(`tag_name` ASC, `created_at` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 66 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of ewon_history
-- ----------------------------
INSERT INTO `ewon_history` VALUES (41, 'Voltage_AN', 226.5327, '2026-01-19 16:11:08');
INSERT INTO `ewon_history` VALUES (42, 'Frekuensi', 49.99683, '2026-01-19 16:11:08');
INSERT INTO `ewon_history` VALUES (43, 'Ampere', 4.591845e-40, '2026-01-19 16:11:08');
INSERT INTO `ewon_history` VALUES (44, 'Kilowatt_hour', 0.004, '2026-01-19 16:11:08');
INSERT INTO `ewon_history` VALUES (45, 'THD_AN', 2.198337, '2026-01-19 16:11:08');
INSERT INTO `ewon_history` VALUES (46, 'Voltage_AN', 225.9294, '2026-01-19 16:14:51');
INSERT INTO `ewon_history` VALUES (47, 'Frekuensi', 50.03002, '2026-01-19 16:14:51');
INSERT INTO `ewon_history` VALUES (48, 'Ampere', 4.591845e-40, '2026-01-19 16:14:51');
INSERT INTO `ewon_history` VALUES (49, 'Kilowatt_hour', 0.004, '2026-01-19 16:14:51');
INSERT INTO `ewon_history` VALUES (50, 'THD_AN', 2.205288, '2026-01-19 16:14:51');
INSERT INTO `ewon_history` VALUES (51, 'Voltage_AN', 225.6574, '2026-01-19 16:15:21');
INSERT INTO `ewon_history` VALUES (52, 'Frekuensi', 50.00394, '2026-01-19 16:15:21');
INSERT INTO `ewon_history` VALUES (53, 'Ampere', 4.591845e-40, '2026-01-19 16:15:21');
INSERT INTO `ewon_history` VALUES (54, 'Kilowatt_hour', 0.004, '2026-01-19 16:15:21');
INSERT INTO `ewon_history` VALUES (55, 'THD_AN', 2.241642, '2026-01-19 16:15:21');
INSERT INTO `ewon_history` VALUES (56, 'Voltage_AN', 225.7138, '2026-01-19 16:15:51');
INSERT INTO `ewon_history` VALUES (57, 'Frekuensi', 49.9848, '2026-01-19 16:15:51');
INSERT INTO `ewon_history` VALUES (58, 'Ampere', 4.591845e-40, '2026-01-19 16:15:51');
INSERT INTO `ewon_history` VALUES (59, 'Kilowatt_hour', 0.004, '2026-01-19 16:15:51');
INSERT INTO `ewon_history` VALUES (60, 'THD_AN', 2.196187, '2026-01-19 16:15:51');
INSERT INTO `ewon_history` VALUES (61, 'Voltage_AN', 225.7333, '2026-01-19 16:16:21');
INSERT INTO `ewon_history` VALUES (62, 'Frekuensi', 49.9782, '2026-01-19 16:16:21');
INSERT INTO `ewon_history` VALUES (63, 'Ampere', 4.591845e-40, '2026-01-19 16:16:21');
INSERT INTO `ewon_history` VALUES (64, 'Kilowatt_hour', 0.004, '2026-01-19 16:16:21');
INSERT INTO `ewon_history` VALUES (65, 'THD_AN', 2.228304, '2026-01-19 16:16:21');

SET FOREIGN_KEY_CHECKS = 1;
