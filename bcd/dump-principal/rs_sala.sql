CREATE DATABASE  IF NOT EXISTS `rs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rs`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: rs
-- ------------------------------------------------------
-- Server version	8.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `sala`
--

DROP TABLE IF EXISTS `sala`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sala` (
  `id_sala` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `bloco` varchar(255) NOT NULL,
  `tipo` varchar(255) NOT NULL,
  `capacidade` int NOT NULL,
  PRIMARY KEY (`id_sala`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sala`
--

LOCK TABLES `sala` WRITE;
/*!40000 ALTER TABLE `sala` DISABLE KEYS */;
INSERT INTO `sala` VALUES (1,'AMA - Automotiva','Alta Mogiana Automotiva','A','Oficina',16),(2,'AMS - Desenvolvimento','Alta Mogiana Desenvolvimento de Sistema','A','Sala',16),(3,'AME - Eletroeletrônica','Alta Mogiana Eletroeletrônica','A','Laboratório',16),(4,'AMM - Manutenção','Alta Mogiana Manutenção','A','Oficina',16),(5,'A2 - ELETRÔNICA','Laboratório de Eletrônica','A','Laboratório',16),(6,'A3 - CLP','Controladores Lógicos Programáveis','A','Laboratório',16),(7,'A4 - AUTOMAÇÃO','Sistemas de Automação','A','Laboratório',20),(8,'A5 - METROLOGIA','Instrumentos de Medição','A','Laboratório',16),(9,'A6 - PNEUMÁTICA','Equipamentos Pneumáticos e Hidráulicos','A','Laboratório',20),(10,'B2 - AULA','Sala de Aula','B','Sala',32),(11,'B3 - AULA','Sala de Aula','B','Sala',32),(12,'B5 - AULA','Sala de Aula','B','Sala',40),(13,'B6 - AULA','Sala de Aula','B','Sala',32),(14,'B7 - AULA','Sala de Aula','B','Sala',32),(15,'B8 - INFORMÁTICA','Laboratório de Informática','B','Laboratório',20),(16,'B9 - INFORMÁTICA','Estação de Trabalho','B','Laboratório',16),(17,'B10 - INFORMÁTICA','Computadores Programáveis','B','Laboratório',16),(18,'B11 - INFORMÁTICA','Equipamentos de Rede','B','Laboratório',40),(19,'B12 - INFORMÁTICA','Laboratório de TI','B','Laboratório',40),(20,'CA - Colorado A1','Sala Multimídia','C','Sala',16),(21,'COF - Colorado Oficina','Ferramentas Manuais','C','Oficina',16),(22,'C1 - AULA (ALP)','Sala de Aula (ALP)','C','Sala',24),(23,'C2 - INFORMATICA','Software Educacional','C','Laboratório',32),(24,'C3 - MODELAGEM','Máquinas de Costura','C','Oficina',20),(25,'C4 - MODELAGEM','Equipamentos de Modelagem','C','Oficina',20),(26,'C5 - AULA','Materiais Didáticos','C','Sala',16),(27,'D1 - MODELAGEM','Ferramentas de Modelagem','D','Oficina',16),(28,'D2 - MODELAGEM','Estações de Trabalho de Modelagem','D','Oficina',20),(29,'D3 - AULA','Quadro e Projetor','D','Sala',16),(30,'D4 - CRIAÇÃO','Materiais de Artesanato','D','Oficina',18),(31,'LAB - ALIMENTOS','Equipamentos de Cozinha','Lab','Laboratório',16),(32,'OFI - AJUSTAGEM/FRESAGEM','Máquinas de Fresagem','Oficina','Oficina',16),(33,'OFI - COMANDOS ELÉTRICOS','Circuitos Elétricos','Oficina','Oficina',16),(34,'OFI - TORNEARIA','Torno Mecânico','Oficina','Oficina',20),(35,'OFI - SOLDAGEM','Equipamentos de Solda','Oficina','Oficina',16),(36,'OFI - MARCENARIA','Ferramentas de Marcenaria','Oficina','Oficina',16),(37,'OFI - LIXAMENTO','Lixadeiras e Polidoras','Oficina','Oficina',16);
/*!40000 ALTER TABLE `sala` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-26 20:21:39
